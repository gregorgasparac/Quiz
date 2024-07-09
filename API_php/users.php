<?php
$DEBUG = true;							

include("tools.php"); 					

$coll = dbConnect();					

header('Content-Type: application/json');	
header('Access-Control-Allow-Origin: *');	
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');		

switch($_SERVER["REQUEST_METHOD"])		
{
	case 'GET':
		if(!empty($_GET["username"]))
		{
			get_user($_GET["username"]);		
		}
		else
		{
			get_all_users();					
		}
		break;

	case 'POST':
		add_user();
		break;
		
	case 'PUT':
		if(!empty($_GET["username"]))
		{
			update_user($_GET["username"]);
		}
		else
		{
			http_response_code(400);	
		}
		break;
		
	case 'DELETE':
		if(!empty($_GET["username"]))
		{
			delete_user($_GET["username"]);
		}
		else
		{
			http_response_code(400);	
		}
		break;
		
	case 'OPTIONS':						
		http_response_code(204);
		break;
		
	default:
		http_response_code(405);		
		break;
}

mysqli_close($coll);					



function add_user()
{
	global $coll, $DEBUG;

	$data = json_decode(file_get_contents("php://input"), true);
	if(isset($data["username"], $data["email"], $data["password"]))
	{
		$username=mysqli_escape_string($coll, $data["username"]);
		$email=mysqli_escape_string($coll, $data["email"]);
		$password=mysqli_escape_string($coll, $data["password"]); 
		$password=password_hash($password, PASSWORD_DEFAULT);
		

		if(!user_already_exists($username))
		{
			$query = "INSERT INTO user (username, email, password) VALUES ('$username', '$email', '$password')";
			if(mysqli_query($coll, $query))
			{
				http_response_code(201); 
				$response = URL_source($username);
				echo json_encode($response);
			}
			else
			{
				http_response_code(500); 

				if($DEBUG) 
				{
					error_message(mysqli_error($zbirka), 666);
				}
			}
		}
		else
		{
			http_response_code(409); 
			error_message("User already exists!", 123); 
		}
	}
	else
	{
		http_response_code(400); 
	}

}

function get_all_users()
{
	global $coll;
	$response=array();
	
	$query="SELECT username, email FROM user";	
	
	$outcome=mysqli_query($coll, $query);
	
	while($row=mysqli_fetch_assoc($outcome))
	{
		$response[]=$row;
	}
	
	http_response_code(200);		
	echo json_encode($response);
}

function get_user($username)
{
	global $coll;
	$username=mysqli_escape_string($coll, $username);
	
	$query="SELECT username, email FROM user WHERE username='$username'";
	
	$outcome=mysqli_query($coll, $query);

	if(mysqli_num_rows($outcome)>0)	
	{
		$response=mysqli_fetch_assoc($outcome);
		
		http_response_code(200);		
		echo json_encode($response);
	}
	else							
	{
		http_response_code(404);		
	}
}

function update_user($username)
{
	global $coll, $DEBUG;
	
	$username = mysqli_escape_string($coll, $username);
	
	$data = json_decode(file_get_contents("php://input"),true);
		
	if(user_already_exists($username))
	{
		if(isset($data["password"]))
		{
			//$username = mysqli_escape_string($coll, $data["username"]);
			//$email = mysqli_escape_string($coll, $data["email"]);
			$password = password_hash(mysqli_escape_string($coll, $data["password"]), PASSWORD_DEFAULT);
			
			
			$query = "UPDATE user SET  password='$password' WHERE username='$username'";
			
			if(mysqli_query($coll, $query))
			{
				http_response_code(204);	
			}
			else
			{
				http_response_code(500);	
				
				if($DEBUG)	
				{
					error_message(mysqli_error($coll));
				}
			}
		}
		else
		{
			http_response_code(400);	
		}
	}
	else
	{
		http_response_code(404);	
	}
}

function delete_user($username)
{	
	global $coll, $DEBUG;
	$username=mysqli_escape_string($coll, $username);

	if(user_already_exists($username))
	{
		$query="DELETE FROM user WHERE username='$username'";
		
		if(mysqli_query($coll, $query))
		{
			http_response_code(204);	
		}
		else
		{
			http_response_code(500);	
			
			if($DEBUG)	
			{
				error_message(mysqli_error($coll));
			}
		}
	}
	else
	{
		http_response_code(404);	
	}
}

?>
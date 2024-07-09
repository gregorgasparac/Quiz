<?php
$DEBUG = true;

include("tools.php"); 			

$coll = dbConnect();			

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	
header("Cache-Control: no-cache, no-store, must-revalidate"); 
header("Pragma: no-cache"); 
header("Expires: 0"); 
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers:Content-Type, Authorization, X-Requested-With");



switch($_SERVER["REQUEST_METHOD"])			
{
	case 'GET':
		if(!empty($_GET["username"]))
		{
			quizzes_of_user($_GET["username"]);
		}
		else
		{
			all_quizzes();
			
		}
		break;
		
	case 'POST':
			add_quiz();
		break;
		
	default:
		http_response_code(405);	
		break;
}

mysqli_close($coll);					

function quizzes_of_user($username)
{
	global $coll;
	$username=mysqli_escape_string($coll, $username);
	$response=array();
	
	if(user_already_exists($username))
	{
		$query="SELECT username, result FROM quiz WHERE username='$username'";
		
		$result=mysqli_query($coll, $query);

		while($row=mysqli_fetch_assoc($result))
		{
			$response[]=$row;
		}
		
		http_response_code(200);		
		echo json_encode($response);
	}
	else
	{
		http_response_code(404);	
	}
}

function all_quizzes()
{
    global $coll;
    $response = array();

    $query = "SELECT quiz_id, username, result FROM quiz";

    $result = mysqli_query($coll, $query);

    while ($row = mysqli_fetch_assoc($result)) {
        $response[] = $row;
    }

    if (!empty($response)) {
        http_response_code(200);     
        echo json_encode($response);
    } else {
        http_response_code(404);    
    }
}

function add_quiz()
{
	global $coll, $DEBUG;
	
	$data = json_decode(file_get_contents('php://input'), true);
	
	if(isset($data["username"], $data["result"]))
	{
		if(user_already_exists($data["username"]))	
		{
			$username = mysqli_escape_string($coll, $data["username"]);
			$result = mysqli_escape_string($coll, $data["result"]);
				
			$query="INSERT INTO quiz (username, result) VALUES ('$username', $result)";
			
			if(mysqli_query($coll, $query))
			{
				http_response_code(201);	
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
			http_response_code(409);
			error_message("User doesn't exists!");
		}
	}
	else
	{
		http_response_code(400);	
	}
}
?>
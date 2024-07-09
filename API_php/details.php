<?php
$DEBUG = true;

include("tools.php"); 			

$coll = dbConnect();			

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	
header("Cache-Control: no-cache, no-store, must-revalidate"); 
header("Pragma: no-cache"); 
header("Expires: 0"); 

switch($_SERVER["REQUEST_METHOD"])			
{
	case 'GET':
		if(!empty($_GET["id"]))
		{
			details($_GET["id"]);
		}
		else
		{
			http_response_code(400);	
		}
		break;
		
		
	case 'POST':
		add_details();
		break;
		
	default:
		http_response_code(405);	
		break;
}

mysqli_close($coll);					


function details($id)
{
	global $coll;
	$id=mysqli_escape_string($coll, $id);
	
	$query="SELECT
						template.template,
						country.country
					FROM
						quiz_details
					JOIN
						template ON quiz_details.template_id = template.template_id
					JOIN
						country ON quiz_details.country_id = country.country_id
					WHERE
						quiz_details.quiz_id = $id";
	
	$result=mysqli_query($coll, $query);
	
	while($row=mysqli_fetch_assoc($result))
	{
		$response[]=$row;
	}
	
	http_response_code(200);		
	echo json_encode($response);
}

function add_details()
{
	global $coll, $DEBUG;
	
	$data = json_decode(file_get_contents('php://input'), true);
	
	if(isset($data["quiz_id"], $data["template_id"], $data["country_id"], $data["question"], $data["answer"], $data["correct"]))
	{
		if(quiz_already_exists($data["quiz_id"]))	
		{
			$quiz_id = mysqli_escape_string($coll, $data["quiz_id"]);
			$template_id = mysqli_escape_string($coll, $data["template_id"]);
			$country_id = mysqli_escape_string($coll, $data["country_id"]);
			$question = mysqli_escape_string($coll, $data["question"]);
			$answer = mysqli_escape_string($coll, $data["answer"]);
			$correct = mysqli_escape_string($coll, $data["correct"]);
				
			$query="INSERT INTO quiz_details (quiz_id , template_id, country_id, question, answer, correct) VALUES ($quiz_id, $template_id, $country_id, '$question', '$answer', '$correct')";
			
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
			error("Quiz doesn't exists!");
		}
	}
	else
	{
		http_response_code(400);
	}
}

?>
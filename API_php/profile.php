<?php
$DEBUG = true;							

include("tools.php"); 					

$coll = dbConnect();					

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	

switch($_SERVER["REQUEST_METHOD"])			
{
	case 'GET':
		if(!empty($_GET["username"]))
		{
			profile($_GET["username"]);
		}
		else
		{
			http_response_code(400);	
		}
		break;
	default:
		http_response_code(405);	
		break;
}

function profile($username)
{
	global $coll;
	$username=mysqli_escape_string($coll, $username);
	$response=array();

	$query="SELECT user.username, COUNT(quiz.result) as quiz_count, MAX(quiz.result) as max_result, user.registration_time
				FROM user
				LEFT JOIN quiz ON user.username = quiz.username
				WHERE user.username = '$username'
				GROUP BY user.username";
	
	$result=mysqli_query($coll, $query);

	while($row = mysqli_fetch_assoc($result))
	{
		$response[]=$row;
	}
	
	http_response_code(200);		
	echo json_encode($response);
}

?>
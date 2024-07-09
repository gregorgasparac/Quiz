<?php
$DEBUG = true;							

include("tools.php"); 					

$coll = dbConnect();					

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	

switch($_SERVER["REQUEST_METHOD"])			
{
	case 'GET':
		leaderboard();
		break;
		
	default:
		http_response_code(405);	
		break;
}

function leaderboard()
{
    global $coll;
    $response = array();

    $query = "SELECT username, result FROM quiz ORDER BY result DESC ";

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
?>
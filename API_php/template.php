<?php
$DEBUG = true;							

include("tools.php"); 					

$coll = dbConnect();					

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	

switch($_SERVER["REQUEST_METHOD"])			
{
	case 'GET':
		if(!empty($_GET["template_id"]))
		{
			template($_GET["template_id"]);
		}
		else
		{
			all_templates();	
		}
		break;
	default:
		http_response_code(405);	
		break;
}

function template($template_id)
{
	global $coll;
	$template_id=mysqli_escape_string($coll, $template_id);
	$response=array();

	$query="SELECT template FROM template WHERE template_id = '$template_id'";
	
	$result=mysqli_query($coll, $query);

	while($row = mysqli_fetch_assoc($result))
	{
		$response[]=$row;
	}
	
	http_response_code(200);		//OK
	echo json_encode($response);
}

function all_templates()
{
    global $coll;
    $response = array();

    $query = "SELECT template FROM template";

    $result = mysqli_query($coll, $query);

    while ($row = mysqli_fetch_assoc($result)) {
        $response[] = $row;
    }

    if (!empty($response)) {
        http_response_code(200);     // OK
        echo json_encode($response);
    } else {
        http_response_code(404);    // Not Found
    }
}
?>


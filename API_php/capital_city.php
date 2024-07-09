<?php
$DEBUG = true;							

include("tools.php"); 					

$coll = dbConnect();					

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');	

switch($_SERVER["REQUEST_METHOD"])
{
	case 'GET':
		if(!empty($_GET["country_id"]))
		{
			country($_GET["country_id"]);		
		}
		else
		{
			all_countries();					
		}
		break;
}

function country($country_id)
{
	global $coll;
	$country_id=mysqli_escape_string($coll, $country_id);
	
	$query="SELECT capital_city FROM country WHERE country_id='$country_id'";
	
	$result=mysqli_query($coll, $query);

	if(mysqli_num_rows($result)>0)	
	{
		$response=mysqli_fetch_assoc($result);
		
		http_response_code(200);		
		echo json_encode($response);
	}
	else							
	{
		http_response_code(404);		
	}
}

function all_countries()
{
	global $coll;
	$response=array();
	
	$query="SELECT capital_city FROM country";	
	
	$result=mysqli_query($coll, $query);
	
	while($row=mysqli_fetch_assoc($result))
	{
		$response[]=$row;
	}
	
	http_response_code(200);		
	echo json_encode($response);
}

?>
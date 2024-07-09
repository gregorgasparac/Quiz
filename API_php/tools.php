<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Allow credentials if needed
// header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400"); // Cache preflight request for 1 day
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    exit;
}

function dbConnect()
{
	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "quiz";

	$conn = mysqli_connect($servername, $username, $password, $dbname);
	mysqli_set_charset($conn,"utf8");
	
	if (mysqli_connect_errno())
	{
		printf("Connection to the database server failed: %s\n", mysqli_connect_error());
		exit();
	} 	
	return $conn;
}

function error_message($text)
{
	$response=array(
		'status' => 0, 
		'error_message'=>$text 
	);
	echo json_encode($response);
}

function user_already_exists($username)
{	
	global $coll;
	$username=mysqli_escape_string($coll, $username);
	
	$query="SELECT * FROM user WHERE username='$username'";
	
	if(mysqli_num_rows(mysqli_query($coll, $query)) > 0)
	{
		return true;
	}
	else
	{
		return false;
	}	
}

function URL_source($source)
{
	if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
	{
		$url = "https"; 
	}
	else
	{
		$url = "http"; 
	}
	$url .= "://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . $source;
	
	return $url; 
}

function quiz_already_exists($quiz_id)
{	
	global $coll;
	$quiz_id=mysqli_escape_string($coll, $quiz_id);
	
	$query="SELECT * FROM quiz WHERE quiz_id='$quiz_id'";
	
	if(mysqli_num_rows(mysqli_query($coll, $query)) > 0)
	{
		return true;
	}
	else
	{
		return false;
	}	
}
?>
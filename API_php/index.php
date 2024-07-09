<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Quiz - API</title>
		<link rel="stylesheet" type="text/css" />
		<style>

		</style>
	</head>
	<body>
		<div class="center">
			<table border="1">
				<tr>USERS</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/users</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get all users</td>
				</tr>
				<tr>
					<td>/users/{username}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get certain user</td>
				</tr>
				<tr>
					<td>/users</td>
					<td>POST</td>
					<td>JSON</td>
					<td>{"username": "____",
						"email": "____",
						"password": "____"}</td>
					<td>add new user</td>
				</tr>
				<tr>
					<td>/users/{username}</td>
					<td>PUT</td>
					<td>JSON</td>
					<td>{"password": "____"}</td>
					<td>update password</td>
				</tr>
				<tr>
					<td>/users/{username}</td>
					<td>DELETE</td>
					<td>JSON</td>
					<td>/</td>
					<td>delete/user</td>
				</tr>
			</table>
			
			<table border="1">
				<tr>QUIZ</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/quiz</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get all played quizzes</td>
				</tr>
				<tr>
					<td>/quiz/{username}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get all played quizzes by certain user</td>
				</tr>
				<tr>
					<td>/quiz</td>
					<td>POST</td>
					<td>JSON</td>
					<td>{"username": "____",
						"result": ____}</td>
					<td>add new quiz</td>
				</tr>
			</table>
			
			<table border="1">
				<tr>TEMPLATES</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/template</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get all templates</td>
				</tr>
				<tr>
					<td>/template/{id}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get certain template</td>
				</tr>
			</table>
			
			<table border="1">
				<tr>LEADERBOARD</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/leaderboard</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get leaderboard</td>
				</tr>
			</table>
			
			<table border="1">
				<tr>PROFILE</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/profile/{username}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get personal data</td>
				</tr>
			</table>
				
			<table border="1">
				<tr>COUNTRIES</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/country</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get all countries</td>
				</tr>
				<tr>
					<td>/country/{country_id}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get certain country</td>
				</tr>
			</table>
			
			<table border="1">
				<tr>QUIZ DETAILS</tr>
				<tr>
					<td>Endpoint</td>
					<td>Method</td>
					<td>MIME type</td>
					<td>Request content</td>
					<td>Description</td>
				</tr>
				<tr>
					<td>/details/{quiz_id}</td>
					<td>GET</td>
					<td>JSON</td>
					<td>/</td>
					<td>get details of certain quiz</td>
				</tr>
				<tr>
					<td>/details</td>
					<td>POST</td>
					<td>JSON</td>
					<td>{"quiz_id": "____",
						"template_id": ____,
						"country_id": ____}</td>
					<td>add details</td>
				</tr>
			</table>
		</div>
	</body>
</html>

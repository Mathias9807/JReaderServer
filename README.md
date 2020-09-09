# JReaderServer
Cloud sync server for JReader browser addon

# Endpoints
There is only a single endpoint, '/'. Different operations are performed by changing the request method. Request body consists of a JSON Object formatted as a string. The object consists of two arrays named "uDict" and "oDict". 

* GET - Fetch entire uDict and oDict dictionaries
* POST - Insert the words in the POST body into the database
* DELETE - Delete the given words from the database

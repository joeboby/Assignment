    
    /*
    * This function gets called at the form submit and handles everything
    * it first gets the current time and then sends the query(s) 
    * When it has the response it then processes the response (gets the information needed for this assignment)
    * Then it creates the html for printing out the data and then prints out the results
    */
    function preformQuery()
    {
        //get the time at the start
        var startDate = new Date();
        var startTime = startDate.getTime();

        var response = sendQuery();

        var toPrint = processResponse(response);

        printResponse(toPrint);

        //get the time now
        var endDate = new Date();
        var endTime = endDate.getTime();
        var totalTime = endTime - startTime;

        //print out the result
        var timeDiv = document.createElement('div');
        timeDiv.setAttribute("id", "timeDiv");
        timeDiv.setAttribute("class", "timeDiv");
        timeDiv.innerHTML = "<p>Time taken: " + totalTime + " milliseconds</p>";
        document.getElementById("searchBox").appendChild(timeDiv);
    }
    
    /*
    * Create and send out the query
    */
    function sendQuery()
    {
        //get the form elements by ID
        var formElements = document.getElementById("queryForm");

        //the start of the query URL
        var queryURL = "https://api.stackexchange.com/2.2/questions?"
        var name = "";
        var value = "";

        var oneWeek = 604800000;//this is the amount of milliseconds in a week
        var currentDate = Date.now();
        var validDate = Math.floor((currentDate - oneWeek) / 1000);

        //use fromdate in order to get only dates that are valid
        queryURL += "fromdate="+validDate+"&site=stackoverflow&order=desc&pagesize=10&";
        //this filter returns the question, the answer and the comments
        queryURL += "filter=!m)BmTleW)yVK9hCoB)VXD44m4-D59Fv8YFMaWFI5tpBKzwTAjBgkjG2a&";

        //go through all the form elements and append the usefull ones onto the queryURL
        for(var i = 0; i < formElements.length; i++)
        {
            name = formElements.elements[i].name;
            value = formElements.elements[i].value;

            //don't add the submit element to the url
            if(name != "IGNORE")
            {
                queryURL += name + "=" + value + "&";
            }
        }                

        var creationResponse, voteResponse;
        //variable to hold all the responses
        var responses = [];

        //send the query about the number of votes
        {
            //declare the request
            var request = new XMLHttpRequest();

            //open and send the request
            var voteQuery = queryURL+"sort=votes";

            request.open('GET', voteQuery, false);
            request.send(null);

            voteResponse = JSON.parse(request.responseText);

            //see if the response was anything worthwhile
            if(!checkResponse(voteResponse))
            {
                return null;
            }
        }

        //send the query about the creation date
        {
            //declare the request
            var request = new XMLHttpRequest();

            //open and send the request
            var creationQuery = queryURL+"sort=creation";

            request.open('GET', creationQuery, false);
            request.send(null);

            creationResponse = JSON.parse(request.responseText);

            //check to see if the response was anything usefull
            if(!checkResponse(creationResponse))
            {
                return null;
            }
        }

        //combine the lists
        responses = voteResponse.items.concat(creationResponse.items);

        //sort the lists based on the date
        responses.sort(function(a, b){return a.creation_date - b.creation_date});
        responses.reverse();

        return responses;
    }

    /*
    * process the response that was received from the query
    * this function also 'prints' the results to the <body> 
    * response is all (20) responses, already sorted
    */
    function processResponse(response)
    {               
        //display the results of the query
        var printing = "";
        
        for(var i = 0; i < response.length; i++)
        {
            var currItem = response[i];
            var date = new Date(currItem.creation_date * 1000);

            //get the 'button' to display the three required parameters
            printing += "<button type=\"button\" class=\"collapsible\"><a href=\"" + currItem.link + "\">" + currItem.title + "</a><p>Date:" + date.toString() + "</p><p>Votes:" + currItem.score + "</p></button>\n";
        
            //get the content for the post (putting it into a collapsible element)
            printing += getContent(currItem);
       }       

        return printing;
    }

    /*
    * get the content of the question asked. This gets the question body, and question comments and question answers.
    * It also gets the question answer comments along with the date and scores of everything, as asked for in the assignment
    */
    function getContent(currResponse)
    {
        //get the content so show if clicked
        var printing = "<div class=\"content\"><p>";

        //first get the body of the question
        printing += "<h3>Body:</h3>";
        printing += currResponse.body + "<br>";

        //then check for comments for the body
        if(typeof currResponse.comments != "undefined")
        {
            printing += "<h3>Body Comments:</h3>";

            //get all the comments
            for(var i = 0; i < currResponse.comments.length; i++)
            {
                var currComment = currResponse.comments[i];
                //get the comment (with the date score and body)
                date = new Date(currComment.creation_date * 1000);
                printing += "<h6>Comment(" + i + ")    Date:" + date.toString() + "     Votes:" + currComment.score + "</h6>";;
                printing += currComment.body;
            }
        }

        //for all the answers
        if(typeof currResponse.answers != "undefined")
        {
            printing += "<h3>Answers:</h3>";
            for(var i = 0; i < currResponse.answers.length; i++)
            {
                var currAnswer = currResponse.answers[i];

                var date = new Date(currAnswer.creation_date * 1000);
                printing += "<h4>Answer(" + i + ")    Date:" + date.toString() + "     Votes:" + currAnswer.score + "</h4>";
                //then get the answers for the question
                printing += currAnswer.body;

                //then get the comments for the answers
                if(typeof currAnswer.comments != "undefined")
                {
                    printing += "<h5>Comments on answer:</h5>";
                    for(var j = 0; j < currAnswer.comments.length; j++)
                    {
                        var currComment = currAnswer.comments[j];

                        //get the comment (with the date score and body)
                        date = new Date(currComment.creation_date * 1000);
                        printing += "<h6>Comment(" + j + ")    Date:" + date.toString() + "     Votes:" + currComment.score + "</h6>";
                        printing += currComment.body;
                    }
                }

                printing += "<br>";
            }
        }

        printing += "</p></div>\n";

        //finished so now return the string
        return printing;
    }

    /*
    * handle printing out the response to the webpage
    */
   function printResponse(printing)
   {
       //---------BEGIN PRINTING---------

       //before we add the response, check if there is one to delete (if there have been multiple queries)
       var existingDiv = document.getElementById("response");
       if(existingDiv != null)
       {
           //remove the element
           existingDiv.remove();
       }

       //add the html code to the document
       var div = document.createElement('div');
       div.setAttribute("id", "response");
       div.innerHTML += printing;
       document.getElementById("Results").appendChild(div);

       //reattach the eventlisteners
       reattachListeners();
   }

   /*
   * use this function to (re)attach listeners to the buttons so that collapsible works.
   */
   function reattachListeners()
   {
       //get all the items with the class 'collapsible'
       var coll = document.getElementsByClassName("collapsible");
       
       //for each of those items
       for (var i = 0; i < coll.length; i++) 
       {
           //add a click listener
           coll[i].addEventListener("click", function() 
           {
               this.classList.toggle("active");

               //get the content (which is the child since we are using nested divs)
               var content = this.nextElementSibling;

               //flip flop them
               if (content.style.display === "block") 
               {
                   content.style.display = "none";
               } 
               else 
               {
                   content.style.display = "block";
               }
         });
       }
   }


    /*
    * check the response to make sure that it is something useful
    * @return returns true if the response is valid, false if there are no items in the response
    */
   function checkResponse(response)
   {
       //check to see if the response was anything usefull
       if(response.items.length == 0)
       {          
           //display a message to the user that there are no responses
           var message = "Sorry, that tag doesn't have any posts on stackoverflow!";
           var div = document.createElement('div');
           div.setAttribute("id", "response");
           div.innerHTML= message;
           document.getElementById("Results").appendChild(div);
           return false;
       }

       return true;
   }
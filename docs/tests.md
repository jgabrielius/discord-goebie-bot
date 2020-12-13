# Tests
These are the manual tests to run to ensure bot is functioning properly:
1. Test signup with all different roles. Make sure user gets correct spot in team list based on role.
Test these formats:
    * Long format
    * Short format
    * With role request
    * Without role Request
    * Today
    * Multiple days ahead
Test Signup with each these roles:
    * Ancient Goebie
    * Ancient Apprentice
    * Goebie Ranger
    * Goebie Fetcher
    * Goebie Caretaker
    * Young Goebie
2. Try these failed signups:
	* Yesterday's date
	* Nonsense request
	* 6 days ahead
	* No role signup
	* Sign up twice to same raid
	* Date and name mixed up
3. Change env to allow for multiple signups and test the following: 
	* Test sign up full by role
	* Test sign up full
4. Test host commands:
	* Test host some day multiple times
	* Test host day with no list
	* Test remove host
	* Test remove host no list
	* Test remove host twice
	* Test remove person wrong date
	* Test remove person not signed up
	* Test remove person
	* Test remove and fill from backup
	* Test remove and not fill due to role

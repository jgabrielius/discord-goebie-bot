
#  discord-goebie-bot

Discord bot for forming teams in Mazcab Academy discord server

  

Link to server: https://discord.gg/egQBwuM

# Local development
1. Create a bot for local development using this guide: https://discordpy.readthedocs.io/en/latest/discord.html
2. Create a server for local development and create these text channels:
	* 18gt-sign-up
	* 18gt-team-list
	* 18gt-hosts
And the following roles:
	* Young Goebie
	* Goebie Caretaker
	* Goebie Fetcher
	* Goebie Ranger
	* Ancient Apprentice
	* Goebie Guide
3. Add your created bot to the server
4. Copy file .env.example to .env
5. Add your discord bot key to BOT_TOKEN in .env file
6. Run `npm install && npm run dev`
# Contribution
Create a feature branch and open a PR to develop branch.
# TODO Features
- [x] Change sign up to 5 days in advance
- [ ] Add "!host <D/M/YYYY>" command for use in 18gt-hosts channel. This command will make the user who posted a HOST in team list if he has "Goebie Guide" role. If team list isn't made yet it should be created (same as sign ups)
- [ ] Add "!remove <@Username> <D/M/YYYY>"  command for use in 18gt-hosts channel. This command will remove the tagged person from team list for that day if he's signed up. Also only available for "Goebie Guide" role.
- [x] Check if teamlist was posted by a person. If it was, return and don't process the signup. This is to help transition the bot in production and also allows users to overwrite the bot for sign ups.
- [ ] Only allow signup once per day. If a user has signed up already message them with an error (like signups). Add a constant so local development can still have multiple signups for user easily.
- [x] Add ancient apprentice in roles
- [x] Tag Goebie Guide in the team list in the HOSTS: section.
- [ ] Allow channels to change to ##gt-sign-up (20gt-signup for example). The time in team list message should be reflected to work. Same goes for ##gt-team-list and ##gt-hosts.

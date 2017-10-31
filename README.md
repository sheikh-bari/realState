Here we will be pushing our code for GSD project

"Steps to take clone and setup project"

git clone -b stagging https://github.com/sheikh-bari/realState.git "foldername"

then move to a sub branch with this command

git checkout -b "nameOfBranch" 

nameOfBranch should be relevant to the task you are doing

After doing your task commit your changes with this command

git commit -am "yourcommit"
your commit should explain what you have done in this task

then go back to the master branch with this command 
git checkout stagging

take pull of the code

git pull origin stagging

then move back to your branch again with either of these commands

git checkout "name_of_your_branch_you_worked_on" OR git checkout - (minus sign takes you to last branch)

then merge your code

git merge stagging

resolve the conflicts if there is any

commit your code again using same command and then push your code

git push origin name_of_your_branch
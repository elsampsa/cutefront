
We start by creating a directory for the project.  

Ask the user where (s)he wants to put that directory.

Next, lets suppose the directory name is `my_cute_app`

Go into that directory and then use this one-liner to create a the project scaffold:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/elsampsa/cutefront/main/new_project.bash)
```
If you want to inspect that script first, feel free to do so.

Now you have the necessary directory structure and the widget base library: 
```
    my_cute_app
    ├── app/                    # Put here the app's .js and .html files
    │    ├── lib/               # library for app-specific widgets
    │    ├── static/            # app static assets
    |    └── landing.html       # the frontend's entry-point
    │
    ├── lib                     # cutefront base widget library cloned from git and detached from the repo
    │    ├── base
    │    ├── bootstrap
    │    |       ├── css  
    │    |       └── js
    │    ├── include            # bootstrap icons, fontawesome, some extra js libraries
    │    ├── render             # widgets based on those extra js libraries
    │    ├── static             # images, etc.
    │    └── train              # training material for AI
    │            └── CLAUDE.md  # context for Claude
    ├── .vscode
    │    ├── launch.json        # debug your cutefront widgets within vscode
    │    └── tasks.json          
    │
    └── .claude
            └── commands
                    └── cute-project-init.md
                                # this very file
                        cute-frontend.md
                                # use shorthand command "/cute-frontend" in claude code 
                                # to restart already existing cutefron project
                        cute-example.md
                                # a command to create the example project
                        current-project.md
                                # users own short-hand command for this project
```
Next, READ IMMEDIATELY `my_cute_app/lib/train/CLAUDE.md`.

Now you know everything about cutefront framework, congrats!

Time to chat with the user:

- App specific widgets are under `app/`, while the base library is under `lib/`
- Example landing page is `landing.html` - user can try to use vscode's debug feature on the left-hand-side vertical menu 
  choose landing html and pick "Cutefront HTML file"
- Tell the user about the commands we have installed:
  /cute-frontend : when continuying this project from a clean context
  /cute-example : create an example project into this project folder
  /current-project : user might want to edit this for a shorthand command to continuing this project from a clean context: reads cute-frontend.md
- What makes cutefront different from other frameworks: ultra lean pure JS and HTML, signal/slot paradigm, well separated testeable widgets with clear-cut APIs, No virtual DOM, whatever *you* think about cutefront

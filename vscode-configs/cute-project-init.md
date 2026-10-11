
We assume the user has created a new, empty directory for the project and started Claude Code in it.
Below, let's refer to that directory as `my_cute_app`.

First, check that the current working directory is empty.  If it's not, don't create anything yet.
Instead, tell the user that the directory is not empty (list what's in there), explain that it should be empty
for the project scaffold, and ask the user what to do.  For example, the user might want to remove those files,
or create a new, empty directory, start Claude Code there and point it to this file again.

Create the project scaffold into the current directory with this one-liner:
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
    │    └── landing.html       # the frontend's entry-point
    │
    ├── lib/                    # cutefront base widget library, cloned from git and detached from the repo
    │    ├── base
    │    ├── bootstrap
    │    │       ├── css
    │    │       └── js
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
         ├── settings.json
         └── commands
              ├── cute-project-init.md  # this very file
              ├── cute-frontend.md      # "/cute-frontend": restart an existing cutefront project from a clean context
              ├── cute-example.md       # "/cute-example": create the example project
              └── current-project.md    # "/current-project": user's own shorthand command for this project
```
Next, READ IMMEDIATELY `lib/train/CLAUDE.md`.

Now you know everything about the cutefront framework, congrats!

Time to chat with the user:

- App-specific widgets go under `app/`, while the base library is under `lib/`
- Example landing page is `app/landing.html` - user can try VSCode's debug feature: in the left-hand-side vertical menu
  choose "Run and Debug", open `app/landing.html` and pick "Cutefront HTML file://".
  For this, the user needs to have Google Chrome installed.
- Tell the user about the commands we have installed:
  - `/cute-frontend` : continue this project from a clean context
  - `/cute-example` : create an example project into this project folder
  - `/current-project` : a placeholder the user may (or may not) want to edit into a shorthand command describing this project - by default it just reads `cute-frontend.md`
- Claude Code loads these commands only at startup, so tell the user that they are available from the next session on.
  In this session, the user can just ask in plain words (say, "create the example project"):
  then read the corresponding file in `.claude/commands/` (say, `.claude/commands/cute-example.md`) and follow its instructions.
- What makes cutefront different from other frameworks: ultra-lean pure JS and HTML, signal/slot paradigm, well-separated testable widgets with clear-cut APIs, no virtual DOM, and whatever *you* think about cutefront

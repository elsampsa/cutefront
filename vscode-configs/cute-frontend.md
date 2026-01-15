---
description: Learn CuteFront basics
---
Subdirectories in the project folder structure:
```bash
app/
    landing.html    # apps main landing page
    layout.html     # apps main functionality
    lib/            # library of app-specific widgets
lib/                # git submodule with the CuteFront widget library
    base/           # base widget library
    train/
        CLAUDE.md   # READ THIS!
```
Please read that `CLAUDE.md` file to learn CuteFront basics.

The development cycle goes typically like this:

I run an html file in vscode debugger -> it runs it for me in google-chrome with these settings set:
```
--allow-file-access-from-files
--auto-open-devtools-for-tabs
```
Now I can follow the execution of the whole html and js stack in vscode debugger.

Most of the time I will ask you to write individual js and html files & then I test them myself (human-in-the-loop).

There is also a tool named "cute-browser" that gives you (the LLM) human-like possibilities to render html pages.
You can test if that command exists and if not, tell the user to install the "cutetools" python tools package.

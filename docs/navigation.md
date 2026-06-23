# Navigation + file interactions

Core file navigation primitives transcend just "Open":

There should be a top bar of the active directory. A dialog should be available to select the active directory.

There should be a side bar showing the markdown files in that directory

Double clicking should open that file

## Folder navigation

We should start with the users home directory selected

I should be able to type the path, and an error will show if after typing that file does not exist

Reloading the application should show the previously loaded folder

## Saving is committing

Saving should present a pop-up for a commit message (similar to using the github markdown editor) and saving should commit
with that message.

It should ask for a short message and a detailed message. At least the short message should be required. The detailed message can be optional.


## No save, open, etc buttons

There's no explicit save, open buttons. Just the file sidebar and the ability to select the active working directory.


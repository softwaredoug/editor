# Corrections management

Corrections largely provided by LanguageTool and LLM

General UI
- a side bar that shows current active issue
- an option to dismiss or apply the suggestion

## Applying the suggestion

Applying the suggestion will perform the suggested replacement

## Dismissing the suggestion

Dismissing the suggestion will ignore this one suggestion permanently for this document.

## Ignore frontmatter

Do not correct yaml frontmatter. It is not part of the document content and should be ignored for corrections.

## Ignore code blocks

Do not correct code blocks. They are not part of the document content and should be ignored for corrections.

## Ignore links

Links should be ignored / not corrected, IE

![image.png](/assets/media/2026/three-kinds-of-agentic-search/image.png)

or 

[foo bar](https://example.com)

The text in parenthesis should not be corrected, but the text in the brackets should be corrected.

### Spelling exceptions / always ignores

Keep a list in the active directory of teh spelling exceptions. This is a text file with one word per line. The words in this file will be ignored for spelling corrections.

That should only apply to the open directory

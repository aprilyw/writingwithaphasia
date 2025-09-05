This is a starter template for [Learn Next.js](https://nextjs.org/learn).

To run development server:
```bash
npm run dev
```




Let me check the contents of the static directory:

Ran tool
I notice we need to add support for markdown files and dynamic page generation. Let's:

1. First add the necessary dependencies for markdown processing
2. Create a structure to handle markdown files and images
3. Update our pages to dynamically generate from the markdown content

Let me add the required dependencies:

```bash
npm install gray-matter remark remark-html next-mdx-remote
```
Now, let's create a utility function to handle markdown files:


Now, let's update our index page to use the markdown data:


Let's update the Sidebar component to handle the markdown content:


Now, let's create a dynamic page for individual stories:


Now we need to create a sample markdown file structure. Let's create a directory for the markdown files and images:

```bash
mkdir -p static/md static/img
```
Let's create a sample markdown file to show the expected format:


I've set up a complete system for handling markdown-based stories with the following features:

1. **Markdown Processing**:
   - Stories are stored as markdown files in `static/md/`
   - Each markdown file has frontmatter with metadata (title, name, coordinates, etc.)
   - The content supports full markdown formatting

2. **Image Handling**:
   - Images are stored in `static/img/<story-id>/`
   - Multiple images per story are supported
   - Images are displayed in a responsive grid

3. **Dynamic Pages**:
   - Each story has its own page at `/stories/[id]`
   - The map shows all story locations
   - Clicking a marker shows the story preview in the sidebar
   - The sidebar has a link to the full story page

To add a new story:

1. Create a markdown file in `static/md/` (e.g., `sherry.md`)
2. Include the required frontmatter (title, name, coordinates, etc.)
3. Write the story content using markdown
4. Create a folder in `static/img/` with the same name (e.g., `static/img/sherry/`)
5. Add images to that folder

The system will automatically:
- Generate the story page
- Add the marker to the map
- Create the preview in the sidebar
- Display all images in a responsive grid

Would you like me to:
1. Create more example stories?
2. Add any additional features to the story display?
3. Modify the styling or layout?
4. Add any other functionality?

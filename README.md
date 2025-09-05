
To run development server:
```bash
npm run dev
```

This project is populated via markdown-based stories with the following features:

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
- Display images in a responsive grid
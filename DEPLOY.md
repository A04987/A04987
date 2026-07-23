# Deploy Portfolio Site

This repository also contains a static portfolio website for GitHub Pages.

## Structure

- `index.html` - GitHub Pages entry file that redirects to the portfolio
- `portfolio/index.html` - main portfolio page
- `portfolio/styles.css` - portfolio styles
- `portfolio/script.js` - portfolio interactions
- `portfolio/asset/` - portfolio artwork assets
- `folder-image/` - profile/gallery media shared with the profile README

## GitHub Pages

1. Push this repository to GitHub.
2. Open repository `Settings` > `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Choose branch `main` and folder `/root`.
5. Save and wait for the Pages URL to finish building.

## Google Drive Gallery

The first gallery section shows six random images from the Roblox character Drive folder on each refresh. The `View all artworks` modal loads images live from Google Drive folders by category.

GitHub Pages cannot list a Google Drive folder directly from browser JavaScript, so the site uses a small Google Apps Script proxy.

Setup:

1. Open Google Apps Script.
2. Create a new project.
3. Paste the code from `drive-gallery-proxy.gs`.
4. Deploy it as a Web App.
5. Set access to `Anyone`.
6. Copy the Web App URL.
7. Paste it into `portfolio/script.js` as `DRIVE_GALLERY_PROXY_URL`.

After that, adding/removing images in these Drive folders updates the modal automatically:

- Roblox character
- Anime
- Vtuber
- Vocaloid
- Fan art

Make sure each Drive folder or image is shared as `Anyone with the link can view`.

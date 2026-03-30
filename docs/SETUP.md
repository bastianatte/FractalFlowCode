# Setup Guide

This project is a static website. You can deploy it on GitHub Pages or any other static host.

## 1. Project Structure

The repository should contain:

- `index.html`
- `style.css`
- `script.js`
- `docs/README.md`
- `docs/CONTENT.md`
- `docs/SETUP.md`

## 2. Deploy on GitHub Pages

1. Create a GitHub repository.
2. Upload the project files to the repository root.
3. Open the repository settings.
4. Go to the Pages section.
5. Select the branch that contains the site files.
6. Set the root folder as the publishing source.
7. Save the changes.
8. Wait for the public URL to appear.

## 3. Connect a Custom Domain

If you want to use a domain such as `fractalflow.it`, follow these steps:

1. Open the repository settings in GitHub.
2. Go to the Pages section.
3. Enter your custom domain.
4. Save the settings.
5. In your DNS provider, add the records requested by GitHub Pages.
6. Wait for DNS propagation.
7. Enable HTTPS once GitHub Pages makes it available.

## 4. Update Content

To edit the site copy:

1. Open `docs/CONTENT.md`.
2. Update the Italian and English versions of the same section.
3. Copy the same changes into `index.html`.
4. Keep the wording short, operational, and specific.

When you update the contact details, also update:

- the Contact section in `index.html`
- the footer if the wording changes
- the meta description and Open Graph tags in the `<head>`

## 5. Update Navigation or Metadata

If you add or rename sections, update these places together:

- the anchor links in the header navigation
- the section `id` attributes in `index.html`
- the language copy in `docs/CONTENT.md`
- any labels in `script.js` that refer to navigation or language state

If the site name, domain, or description changes, update:

- `<title>`
- `<meta name="description">`
- Open Graph meta tags
- the custom domain settings in GitHub Pages

## 6. Maintenance Notes

- No build process is required.
- No npm install is required.
- No external dependencies are used.
- The language toggle works with a small JavaScript file and saved browser preference.

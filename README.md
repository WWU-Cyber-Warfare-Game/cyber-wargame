# Cyber Wargame

## Notes for setting up
- In `frontend`, make a `.env` file using `.env.example`.
- In `backend`, make a `.env.local` file using `.env.local.example`.
- Generate an API key with full permissions in Strapi and set `STRAPI_API_KEY` in `.env.local`.
- Run `npm run strapi import -- -f testdata.tar.gz` to import test data.
- Teams and roles must be assigned to users in the Strapi content manager.

## Figma Design Link 
https://www.figma.com/file/XcUKMbDtdU089AALdSTlDZ/SP-Landing?type=design&mode=design&t=vDXiULTKo9GHUpCH-1

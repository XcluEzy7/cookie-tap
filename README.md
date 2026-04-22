# Cookie Clicker - Enhanced Edition

A SvelteKit-based cookie clicker game deployed to GitHub Pages.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is automatically deployed to GitHub Pages via `.github/workflows/deploy-pages.yml` when pushing to the `main` branch.

**Live URL**: https://xcluezy7.github.io/cookie-tap/

## Architecture

This project follows ADRs (Architecture Decision Records):

- **ADR-1**: SvelteKit with `@sveltejs/adapter-static` for GitHub Pages deployment
- **ADR-2**: Game logic isolated in `src/lib/game/*` modules (pending migration)
- **ADR-3**: Versioned save schema with legacy `cookieClickerSave` migration (pending)
- **ADR-4**: Parity-first migration phases before new features

## Legacy

The original single-file PWA implementation is preserved in `legacy/` for reference during migration.

## License

MIT
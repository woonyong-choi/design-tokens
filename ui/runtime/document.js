import { mountDocumentWidgets } from './document-widgets.js';

mountDocumentWidgets(document, { platform: new URLSearchParams(location.search).get('platform') ?? undefined });

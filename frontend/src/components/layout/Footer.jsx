import React from 'react';
import { ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <p>
      <span className="app-footer__project">Supportly</span>
      <span className="app-footer__separator" aria-hidden="true">•</span>
      Built by <span className="app-footer__author">Bou-eng</span>
    </p>

    <a
      className="app-footer__link"
      href="https://github.com/Bou-eng"
      target="_blank"
      rel="noreferrer"
      aria-label="Visit Bou-eng on GitHub (opens in a new tab)"
    >
      <ExternalLink size={16} aria-hidden="true" />
      GitHub
    </a>
  </footer>
);

export default Footer;

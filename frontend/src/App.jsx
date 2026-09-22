import React from 'react';
import { useTheme } from './context/ThemeContext';
import Card from './components/common/Card';
import Button from './components/common/Button';
import Badge from './components/common/Badge';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1rem' }}>
      <Card title="Supportly UI System Test">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span>Current Theme: <strong>{theme.toUpperCase()}</strong></span>
          <Button variant="outline" onClick={toggleTheme}>
            Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>

        <h4 style={{ marginBottom: '0.5rem' }}>Ticket Status Badges:</h4>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Badge variant="status-open">Open</Badge>
          <Badge variant="status-in-progress">In Progress</Badge>
          <Badge variant="status-resolved">Resolved</Badge>
          <Badge variant="status-closed">Closed</Badge>
        </div>

        <h4 style={{ marginBottom: '0.5rem' }}>Ticket Priority Badges:</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge variant="priority-high">High</Badge>
          <Badge variant="priority-medium">Medium</Badge>
          <Badge variant="priority-low">Low</Badge>
        </div>
      </Card>
    </div>
  );
}

export default App;
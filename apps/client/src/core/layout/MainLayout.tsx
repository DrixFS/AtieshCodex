import React from 'react';
import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useUIStore } from '../stores';

/**
 * Primary layout container wrapping routed views with dynamic MobX theme observation.
 */
export const MainLayout: React.FC = observer(() => {
  const uiStore = useUIStore();

  return (
    <div className={`app-layout theme-${uiStore.theme}`}>
      <Outlet />
    </div>
  );
});

import React, { useState } from 'react';
import IconLogout from './icons/IconLogout.jsx';
import NylasLogo from './icons/nylas-logo-horizontal.svg';
import CILogo from './icons/contraband interactive 2023 logo.png'
import PropTypes from 'prop-types';
import Toast from './Toast';

const Layout = ({
  children,
  showMenu = false,
  disconnectUser,
  title,
  toastNotification,
  setToastNotification,
}) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = (e) => {
    e.preventDefault();
    setIsDisconnecting(true);
    setTimeout(() => {
      disconnectUser();
      setIsDisconnecting(false);
    }, 1500);
  };

  return (
    <div className="layout">
      <div className="title-menu">
        <h1>{title || 'AI Booking Agent'}</h1>

        <Toast
          toastNotification={toastNotification}
          setToastNotification={setToastNotification}
        />
        {showMenu && (
          <div className="menu">
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting || toastNotification}
            >
              <div className="menu-icon">
                <IconLogout />
              </div>
              <span className="hidden-mobile">
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect account'}
              </span>
            </button>
          </div>
        )}
      </div>
      <main>{children}</main>
      <footer>
        <div className="logo">
          <a href="https://www.contrabandinteractive.com"><img src={CILogo} alt="Contraband Interactive" width="140" /></a>
        </div>
      </footer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.element.isRequired,
  showMenu: PropTypes.bool.isRequired,
  disconnectUser: PropTypes.func,
  title: PropTypes.string,
  toastNotification: PropTypes.string,
  setToastNotification: PropTypes.func.isRequired,
};

export default Layout;

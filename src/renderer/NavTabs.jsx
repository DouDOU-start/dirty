import * as React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function LinkTab(props) {
  return <Tab component={Link} {...props} />;
}

LinkTab.propTypes = {
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

export default function NavTabs() {
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    switch (location.pathname) {
      case '/home':
        setValue(0);
        break;
      case '/chart':
        setValue(1);
        break;
      case '/about':
        setValue(2);
        break;
      default:
        setValue(0);
        break;
    }
  }, [location]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        orientation="vertical"
        aria-label="nav tabs example"
        variant="scrollable"
        sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}
      >
        <LinkTab label="主页" to="/home" />
        <LinkTab label="图表" to="/chart" />
        {/* <LinkTab label="终端" to="/terminal" /> */}
        <LinkTab label="关于" to="/about" />
      </Tabs>
    </Box>
  );
}
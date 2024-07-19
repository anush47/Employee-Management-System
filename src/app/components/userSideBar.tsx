"use client";
import * as React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Home,
  Business,
  Settings,
  Menu,
  Inbox,
  Mail,
  MoneyRounded,
  AccountBox,
} from "@mui/icons-material";
import Link from "next/link";

const drawerWidth = 280;

interface Props {
  window?: Window | undefined;
  selected: string;
}

const ResponsiveDrawer: React.FC<Props> = ({ window, selected }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menus = [
    { name: "Dashboard", icon: <Home />, link: "/user/dashboard" },
    {
      name: "My Companies",
      icon: <Business />,
      link: "/user/mycompanies",
    },
    { name: "Settings", icon: <Settings />, link: "/user/settings" },
  ];

  const drawer = (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          backgroundColor: "#f5f5f5",
          color: "#333",
        }}
      >
        <Typography variant="h5" noWrap component="div">
          Salary App
        </Typography>
      </Box>
      <Divider />
      <List>
        {menus.map((menu) => (
          <ListItem key={menu.name} disablePadding>
            <ListItemButton
              selected={selected === menu.name}
              component={Link}
              href={menu.link}
            >
              <ListItemIcon sx={{ color: "#333" }}>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon sx={{ color: "#333" }}>
                {index % 2 === 0 ? <Inbox /> : <Mail />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          display: { xs: "block", sm: "none" }, // Show only on small screens
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <Menu />
          </IconButton>
          <Typography
            className="block xs::hidden"
            variant="h5"
            noWrap
            component="div"
          >
            Salary App
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default ResponsiveDrawer;

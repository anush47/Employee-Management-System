"use client";
import * as React from "react";
import "@fontsource/roboto/400.css";
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Breadcrumbs,
} from "@mui/material";
import {
  Business,
  Menu as MenuIcon,
  Groups,
  Payments,
  ArrowBack,
  Home,
  NavigateNext,
  Money,
  LocalAtm,
} from "@mui/icons-material";
import Link from "next/link";
import { Link as LinkM } from "@mui/material";
import { useSearchParams, useParams } from "next/navigation";

const drawerWidth = 300;

//export selected type
export type Selected =
  | "dashboard"
  | "details"
  | "employees"
  | "payments"
  | "salaries";

interface Props {
  window?: Window | undefined;
  user: { name: string; email: string };
}
export let selected: Selected = "details";
export let companyId: string;

const CompanySideBar: React.FC<Props> = ({ window, user }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  //get id from params of url
  const params = useParams();
  if (params && params.id) {
    companyId = params.id.toString();
  }

  //search params to get selected
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("companyPageSelect");
  if (selectedParam) {
    selected = selectedParam as Selected;
  }
  //if wrong params default to dashboard
  if (
    !["dashboard", "details", "employees", "payments", "salaries"].includes(
      selected
    )
  ) {
    selected = "details";
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menus = [
    {
      name: "Dashboard",
      key: "dashboard",
      icon: <Home />,
    },
    {
      name: "Company Details",
      key: "details",
      icon: <Business />,
    },
    {
      name: "Employees",
      key: "employees",
      icon: <Groups />,
    },
    {
      name: "Salaries",
      key: "salaries",
      icon: <LocalAtm />,
    },

    {
      name: "Payments",
      key: "payments",
      icon: <Payments />,
    },
  ];

  const [breadcrumbs, setBreadcrumbs] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    setBreadcrumbs([
      <LinkM underline="hover" key="1" color="inherit" href="/">
        Home
      </LinkM>,
      <LinkM
        underline="hover"
        key="2"
        color="inherit"
        href="
      /user?userPageSelect=mycompanies
    "
      >
        My Companies
      </LinkM>,
      <LinkM underline="none" key="3" color="text.primary">
        {selected === "dashboard"
          ? "Dashboard"
          : selected === "details"
          ? "Company Details"
          : selected === "employees"
          ? "Employees"
          : selected === "salaries"
          ? "Salaries"
          : "Payments"}
      </LinkM>,
    ]);
  }, [selected]);

  const drawer = (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 3,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography color="primary" variant="h6" noWrap component="div">
          {user.name === "" ? "Stranger" : user.name}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {user.email === "" ? "No email" : user.email}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menus.map((menu) => (
          <ListItem key={menu.name} disablePadding>
            <ListItemButton
              selected={selected === menu.key}
              onClick={() => handleDrawerToggle()}
              component={Link}
              href={`
                /user/mycompanies/${companyId}?companyPageSelect=${menu.key}`}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#e0f7fa",
                  "& .MuiListItemIcon-root": {
                    color: "#00796b",
                  },
                },
              }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem key="back" disablePadding>
          <ListItemButton
            component={Link}
            href="/user?userPageSelect=mycompanies"
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#e0f7fa",
                "& .MuiListItemIcon-root": {
                  color: "#00796b",
                },
              },
            }}
          >
            <ListItemIcon>
              <ArrowBack />
            </ListItemIcon>
            <ListItemText primary="Back" />
          </ListItemButton>
        </ListItem>
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <div className="flex-grow">
            <Link href={"/"}>
              <Typography
                variant="h5"
                sx={{ flexGrow: 1 }}
                noWrap
                component="div"
              >
                Salary App
              </Typography>
            </Link>
          </div>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={
              //hide in small
              {
                display: { xs: "none", md: "block" },
              }
            }
          >
            {breadcrumbs}
          </Breadcrumbs>
          <IconButton onClick={handleMenuClick} color="inherit">
            <Avatar></Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                sx: {
                  width: 200,
                },
              },
            }}
          >
            <MenuItem
              component={Link}
              href="/user?userPageSelect=settings"
              onClick={handleMenuClose}
            >
              Settings
            </MenuItem>
            <Divider />
            <MenuItem component={Link} href="/api/auth/signout">
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
            display: { xs: "block", md: "none" },
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
            display: { xs: "none", md: "block" },
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

export default CompanySideBar;

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
  AvatarGroup,
  useTheme,
} from "@mui/material";
import {
  Home,
  Business,
  Settings,
  Menu as MenuIcon,
  NavigateNext,
  ShoppingBag,
  Groups,
  LocalAtm,
  Payments,
  CalendarMonth,
  Group,
  ArrowBack,
} from "@mui/icons-material";
import Link from "next/link";
import { Link as LinkM } from "@mui/material";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ThemeSwitch } from "@/app/theme-provider";

const drawerWidth = 300;

//export selected type
export type Selected = "users" | "calendar";

interface Props {
  window?: Window | undefined;
  user: { name: string; email: string; role: string; image: string };
}
export let selected: Selected = "users";

const AdminSideBar: React.FC<Props> = ({ window, user }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  //search params to get selected
  const searchParams = useSearchParams();
  const selectedParam = searchParams?.get("adminPageSelect");
  if (selectedParam) {
    selected = selectedParam as Selected;
  }
  //if wrong params default to mycompanies
  if (!["users", "calendar"].includes(selected)) {
    selected = "users";
  }

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menus = [
    {
      name: "Users",
      key: "users",
      icon: <Group />,
    },
    {
      name: "Calendar",
      key: "calendar",
      icon: <CalendarMonth />,
    },
  ];

  const [breadcrumbs, setBreadcrumbs] = React.useState<React.ReactNode[]>([]);
  React.useEffect(() => {
    setBreadcrumbs([
      <LinkM underline="hover" key="1" color="text.main" href="/">
        Admin
      </LinkM>,
      <LinkM underline="none" key="2" color="text.main">
        {(() => {
          switch (selected) {
            case "users":
              return "Users";
            case "calendar":
              return "Calendar";
            default:
              return "";
          }
        })()}
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
        }}
      >
        <Avatar
          alt={user.name}
          src={user.image}
          sx={{ width: 80, height: 80, mb: 2 }}
        />
        <Typography
          color="primary"
          variant="h6"
          noWrap
          component="div"
          sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {user.name === "" ? "Stranger" : user.name}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menus.map((menu) => (
          <ListItem key={menu.name} disablePadding>
            <ListItemButton
              selected={selected === menu.key}
              onClick={() => {
                if (selected !== menu.key) {
                  selected = menu.key as Selected;
                }
              }}
              component={Link}
              href={`/admin/?adminPageSelect=${menu.key}`}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
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
            href="/"
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
          //backgroundColor: theme.palette.background.default,
          //color: theme.palette.primary.main,
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
          <div
            className="flex-grow"
            style={{ display: "flex", alignItems: "center" }}
          >
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
            <Image
              src="/Logo.png"
              alt="Logo"
              width={30}
              height={30}
              style={{
                padding: 0,
                margin: 0,
                marginLeft: 2,
                objectFit: "fill",
              }}
            />
          </div>
          <Breadcrumbs
            separator={<NavigateNext fontSize={"small"} />}
            aria-label="breadcrumb"
            sx={
              //hide in small
              {
                display: { xs: "none", sm: "block" },
              }
            }
          >
            {breadcrumbs}
          </Breadcrumbs>
          <div className="mx-4">
            <ThemeSwitch />
          </div>
          <IconButton onClick={handleMenuClick} color="inherit">
            <Avatar alt={user.name} src={user.image} />
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

export default AdminSideBar;

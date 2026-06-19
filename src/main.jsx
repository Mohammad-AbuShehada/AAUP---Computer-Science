import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LinkIcon from "@mui/icons-material/Link";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TelegramIcon from "@mui/icons-material/Telegram";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import CodeIcon from "@mui/icons-material/Code";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloudIcon from "@mui/icons-material/Cloud";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import "./styles.css";
import { coursesData } from "./data/courses";

const categoryClasses = {
  "اجباري جامعة": "mandatory-college",
  "اجباري كلية": "mandatory-college",
  "اجباري تخصص": "mandatory-specialty",
  "اختياري تخصص": "elective-specialty",
  "اختياري جامعة": "elective-college",
  "مساق حر": "free-course",
  "ملفات أخرى": "other-files"
};

const navItems = [
  { key: "about", label: "دليل الموقع", icon: <LinkIcon /> },
  { key: "courses", label: "المواد", icon: <MenuBookIcon /> }
];

function App() {
  const [page, setPage] = useState("courses");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const theme = useMemo(
    () =>
      createTheme({
        direction: "rtl",
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#1e3a8a", light: "#3b82f6" },
          secondary: { main: "#dc2626" },
          warning: { main: "#f59e0b" },
          background: {
            default: darkMode ? "#0f172a" : "#f8fafc",
            paper: darkMode ? "#1e293b" : "#ffffff"
          }
        },
        typography: {
          fontFamily: "Cairo, Segoe UI, Tahoma, sans-serif",
          button: { textTransform: "none", fontWeight: 700 }
        },
        shape: { borderRadius: 8 }
      }),
    [darkMode]
  );

  function toggleTheme() {
    setDarkMode((current) => {
      localStorage.setItem("darkMode", String(!current));
      return !current;
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={darkMode ? "app-shell dark-mode" : "app-shell"}>
        <Header page={page} setPage={setPage} darkMode={darkMode} toggleTheme={toggleTheme} />
        <Container maxWidth="lg" className="main-container">
          {page === "courses" ? <CoursesPage /> : <AboutPage setPage={setPage} />}
        </Container>
        <Footer setPage={setPage} />
        <ChatBot />
      </Box>
    </ThemeProvider>
  );
}

function Header({ page, setPage, darkMode, toggleTheme }) {
  return (
    <AppBar position="sticky" className="topbar" elevation={0}>
      <Toolbar className="topbar-toolbar">
        <Button className="brand" color="inherit" startIcon={<SchoolIcon />} onClick={() => setPage("courses")}>
          AAUP - CS HUB
        </Button>
        <Stack direction="row" spacing={1} alignItems="center" className="nav-links">
          <Divider orientation="vertical" flexItem className="nav-divider" />
          {navItems.map((item) => (
            <Button
              key={item.key}
              color="inherit"
              startIcon={item.icon}
              className={page === item.key ? "nav-button active" : "nav-button"}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </Button>
          ))}
          <Tooltip title="تبديل الوضع">
            <IconButton color="inherit" className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [category, setCategory] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return coursesData.filter((course) => {
      const matchSearch =
        !term ||
        course.name.toLowerCase().includes(term) ||
        (course.code && course.code.toLowerCase().includes(term));
      const matchYear = !year || course.year === Number(year);
      const matchSemester = !semester || course.semester === Number(semester);
      const matchCategory = !category || course.category === category;
      return matchSearch && matchYear && matchSemester && matchCategory;
    });
  }, [search, year, semester, category]);

  useEffect(() => {
    setPageNumber(1);
  }, [search, year, semester, category, pageSize]);

  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  const firstItem = pageSize === "all" ? 0 : (pageNumber - 1) * pageSize;
  const visibleCourses = pageSize === "all" ? filtered : filtered.slice(firstItem, firstItem + pageSize);
  const shownFrom = filtered.length ? firstItem + 1 : 0;
  const shownTo = pageSize === "all" ? filtered.length : Math.min(firstItem + pageSize, filtered.length);

  return (
    <Box className="courses-page">
      <Paper className="courses-hero" elevation={0}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} gap={2}>
          <Box>
            <Typography variant="overline" className="hero-kicker">
              AAUP Computer Science
            </Typography>
            <Typography variant="h4" component="h1" className="page-title">
              مواد قسم علم الحاسوب
            </Typography>
            <Typography color="text.secondary" className="page-subtitle">
              الجامعة العربية الأمريكية - كلية تكنولوجيا المعلومات
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} className="hero-actions">
            <Button className="telegram-link" href="https://t.me/+FXBLkcvtp780NjQ0" target="_blank" startIcon={<TelegramIcon />}>
              قناة Telegram
            </Button>
            <Button className="telegram-link green" href="https://t.me/+1E5JKHa6wlQxZTM0" target="_blank" startIcon={<TelegramIcon />}>
              جروب المناقشات
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper className="search-panel" elevation={0}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems="stretch">
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المساق أو الكود..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" className="search-button" startIcon={<SearchIcon />}>
            بحث
          </Button>
        </Stack>
      </Paper>

      <Paper className="filters-panel" elevation={0}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" gap={1} className="panel-title-row">
          <Typography className="panel-title">
            <FilterAltIcon />
            تصفية المواد
          </Typography>
          <Typography className="panel-hint">اختر السنة أو الفصل أو نوع المساق</Typography>
        </Stack>
        <Grid container spacing={2.5}>
          <FilterSelect label="السنة" icon={<MenuBookIcon />} value={year} onChange={setYear} options={[
            ["", "كل السنوات"],
            ["1", "سنة أولى"],
            ["2", "سنة ثانية"],
            ["3", "سنة ثالثة"],
            ["4", "سنة رابعة"]
          ]} />
          <FilterSelect label="الفصل" icon={<CalendarMonthIcon />} value={semester} onChange={setSemester} options={[
            ["", "كل الفصول"],
            ["1", "الفصل الأول"],
            ["2", "الفصل الثاني"]
          ]} />
          <FilterSelect label="النوع" icon={<LocalOfferIcon />} value={category} onChange={setCategory} options={[
            ["", "كل الأنواع"],
            ["اجباري جامعة", "إجباري جامعة"],
            ["اجباري كلية", "إجباري كلية"],
            ["اجباري تخصص", "إجباري تخصص"],
            ["اختياري تخصص", "اختياري تخصص"],
            ["اختياري جامعة", "اختياري جامعة"],
            ["مساق حر", "مساق حر"],
            ["ملفات أخرى", "ملفات أخرى (موارد إضافية)"]
          ]} />
        </Grid>
      </Paper>

      <Paper className="results-toolbar" elevation={0}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={2}>
          <Stack gap={0.35}>
            <Typography className="results-counter">عدد النتائج: {filtered.length} مساق</Typography>
            <Typography className="results-range">
              عرض {shownFrom} - {shownTo} من {filtered.length}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1.25} className="limit-control">
            <Typography className="limit-label">
              <FormatListNumberedIcon />
              عدد المواد
            </Typography>
            <FormControl size="small" className="limit-select">
              <Select value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value="all">الكل</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2.5} className="courses-grid">
        {visibleCourses.length ? visibleCourses.map((course, index) => (
          <Grid item xs={12} md={6} key={course.id}>
            <RevealOnScroll direction={index % 2 === 0 ? "right" : "left"}>
              <CourseCard course={course} />
            </RevealOnScroll>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <EmptyState />
          </Grid>
        )}
      </Grid>

      {filtered.length && pageSize !== "all" ? (
        <Paper className="pagination-panel" elevation={0}>
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={(_, value) => setPageNumber(value)}
            color="primary"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
          />
        </Paper>
      ) : null}
    </Box>
  );
}

function RevealOnScroll({ children, direction = "right" }) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={elementRef} className={`reveal-on-scroll reveal-${direction} ${visible ? "is-visible" : ""}`}>
      {children}
    </Box>
  );
}

function FilterSelect({ label, icon, value, onChange, options }) {
  return (
    <Grid item xs={12} md={4}>
      <Typography className="filter-label">
        {icon}
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map(([optionValue, optionLabel]) => (
            <MenuItem key={optionValue || "all"} value={optionValue}>
              {optionLabel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
}

function CourseCard({ course }) {
  return (
    <Card className="course-card" elevation={0}>
      <CardContent>
        <Box className="course-head">
          <Box className="course-icon">
            <AutoStoriesIcon />
          </Box>
          <Box className="course-title-block">
            <Typography className="course-name">{course.name}</Typography>
            {course.code ? <Chip label={course.code} className="course-code" /> : null}
          </Box>
        </Box>
        <Box className="course-details">
          <Stack direction="row" flexWrap="wrap" gap={0.75} className="course-meta">
            {course.year ? <MetaItem icon={<WorkspacePremiumIcon />} text={`سنة ${course.year}`} /> : null}
            {course.semester ? <MetaItem icon={<CalendarMonthIcon />} text={`فصل ${course.semester}`} /> : null}
            <Chip label={course.category} className={`category-badge ${categoryClasses[course.category] || "mandatory-specialty"}`} />
          </Stack>
        </Box>
        <Box className="course-actions">
          <Button href={course.driveUrl} target="_blank" variant="contained" className="drive-link-btn" startIcon={<FolderOpenIcon />} endIcon={<OpenInNewIcon />}>
            فتح في Google Drive
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function MetaItem({ icon, text }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75} className="meta-item">
      {icon}
      <span>{text}</span>
    </Stack>
  );
}

function EmptyState() {
  return (
    <Paper className="empty-state" elevation={0}>
      <SearchIcon />
      <Typography variant="h6">لم يتم العثور على مساقات</Typography>
    </Paper>
  );
}

function AboutPage({ setPage }) {
  return (
    <Box>
      <AboutSection title="من نحن">
        <Typography>نحن طلاب علم حاسوب في الجامعة العربية الأمريكية، جمعنا شغف البرمجة وحب مشاركة الفائدة، فأنشأنا هذا الموقع ليكون مرجعاً بسيطاً ومفيداً للمواد والتلخيصات الجامعية.</Typography>
        <Typography>عملنا على ترتيب المحتوى بأسلوب واضح ليساعد الطلبة على الدراسة بذكاء وفهم أسرع.</Typography>
      </AboutSection>

      <AboutSection title="ما الذي يميز تطبيقنا؟">
        <Typography>بحث ذكي باسم المساق: توصل لأي مادة بسهولة، مع تحديد السنة والفصل الدراسي المناسب.</Typography>
        <Typography>موارد متكاملة: سلايدات، تلخيصات، وأسئلة سنوات سابقة منظمة بالكامل.</Typography>
        <Typography>واجهة سهلة الاستخدام: تصميم بسيط يركز على المحتوى، بدون تعقيدات.</Typography>
        <Typography>تحديثات مستمرة: نضيف مواد جديدة ونحدث المحتوى بانتظام لضمان أفضل تجربة دراسية.</Typography>
        <Typography>مجتمع داعم: انضم إلى قنواتنا على Telegram للتواصل مع زملائك وتبادل الأفكار والملاحظات.</Typography>
        <Typography>هدفنا هو توفير أداة فعالة تساعد الطلبة على التفوق في دراستهم وتحقيق أهدافهم الأكاديمية.</Typography>
        <Typography>يتيح الشات بوت خاصية البحث السريع للوصول إلى المعلومات بسهولة وفي وقت قياسي.</Typography>
        <Paper className="creators-card" elevation={0}>
          <Typography variant="h6">
            <CodeIcon /> إعداد وتطوير
          </Typography>
          <Grid container spacing={2} mt={0.5}>
            {["محمد أبو شحادة", "ضحى كميل", "ساجد كتانه"].map((name) => (
              <Grid item xs={12} md={4} key={name}>
                <Paper className="creator-name" elevation={0}>
                  <AccountCircleIcon />
                  <span>{name}</span>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Typography color="text.secondary" mt={2}>
            طلاب علم الحاسوب | الجامعة العربية الأمريكية
          </Typography>
        </Paper>
      </AboutSection>

      <AboutSection title="الملفات والروابط" icon={<FolderOpenIcon />}>
        <Grid container spacing={3} mt={1}>
          <LinkCard icon={<TelegramIcon />} title="قناة Telegram" text="آخر التحديثات والإعلانات المهمة" href="https://t.me/+FXBLkcvtp780NjQ0" />
          <LinkCard icon={<TelegramIcon />} title="جروب المناقشات" text="نقاش الأسئلة وتبادل التلخيصات" href="https://t.me/+1E5JKHa6wlQxZTM0" />
          <LinkCard icon={<CloudIcon />} title="ملفات أخرى" text="موارد إضافية ومفيدة" href="https://drive.google.com/drive/folders/1aTYU-YwIGNGbo5TyfP3n-qsRuo3DZHVd" />
        </Grid>
      </AboutSection>
    </Box>
  );
}

function AboutSection({ title, icon, children }) {
  return (
    <Paper className="about-section" elevation={0}>
      <Typography variant="h5" component="h2">
        {icon}
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function LinkCard({ icon, title, text, href }) {
  return (
    <Grid item xs={12} md={4}>
      <Paper component="a" href={href} target="_blank" className="link-card" elevation={0}>
        {icon}
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{text}</Typography>
      </Paper>
    </Grid>
  );
}

function Footer({ setPage }) {
  const people = [
    {
      name: "محمد أبو شحادة",
      links: [
        ["LinkedIn", "https://www.linkedin.com/in/mohammad-abushehada/", <LinkedInIcon />],
        ["GitHub", "https://github.com/Mohammad-AbuShehada", <GitHubIcon />],
        ["YouTube", "https://www.youtube.com/channel/UCfAN385oneBRauz096gkQow", <YouTubeIcon />]
      ]
    },
    {
      name: "ضحى كميل",
      links: [
        ["LinkedIn", "https://www.linkedin.com/in/duha-kmail/", <LinkedInIcon />],
        ["GitHub", "https://github.com/Duha-kmail", <GitHubIcon />]
      ]
    },
    {
      name: "ساجد كتانه",
      links: [
        ["LinkedIn", "https://www.linkedin.com/in/sajed-kittanh", <LinkedInIcon />],
        ["GitHub", "https://github.com/sajed-hue", <GitHubIcon />]
      ]
    }
  ];

  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4} className="footer-content">
          {people.map((person) => (
            <Grid item xs={12} md={3} key={person.name}>
              <Typography className="footer-title">
                <PersonIcon /> {person.name}
              </Typography>
              <Stack className="footer-links">
                {person.links.map(([label, href, icon]) => (
                  <Link key={href} href={href} target="_blank" underline="none">
                    {icon} {label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
          <Grid item xs={12} md={3}>
            <Typography className="footer-title">
              <InfoIcon /> عن الموقع
            </Typography>
            <Stack className="footer-links">
              <Link component="button" underline="none" onClick={() => setPage("about")}>
                الروابط والملفات
              </Link>
              <Link component="button" underline="none" onClick={() => setPage("courses")}>
                المواد الدراسية
              </Link>
            </Stack>
          </Grid>
        </Grid>
        <Divider />
        <Typography className="footer-bottom">
          © 2025 الجامعة العربية الأمريكية - قسم علم الحاسوب. جميع الحقوق محفوظة.
        </Typography>
      </Container>
    </Box>
  );
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "مرحباً! اسألني عن أي مادة وسأحاول إيجاد روابطها لك." }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "bot", text: data.reply || "" }]);
    } catch {
      setMessages((current) => [...current, { role: "bot", text: "عذراً، حدث خطأ." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Fab className="bot-launcher" onClick={() => setOpen((current) => !current)}>
        <SmartToyIcon />
      </Fab>
      {open ? (
        <Paper className="bot-window" elevation={8}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" className="bot-header">
            <Box>
              <Typography fontWeight={700}>مبتكر - مساعد الطلاب</Typography>
              <Typography variant="caption">Developed by Sajed Kittanh</Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack className="bot-messages">
            {messages.map((message, index) => (
              <Box key={`${message.role}-${index}`} className={`msg-container ${message.role}`}>
                <Box className="bubble">
                  {message.text.startsWith("http") ? (
                    <Link href={message.text} target="_blank">اضغط هنا لفتح الرابط</Link>
                  ) : (
                    message.text
                  )}
                </Box>
              </Box>
            ))}
            {loading ? (
              <Box className="msg-container bot">
                <Box className="bubble">...</Box>
              </Box>
            ) : null}
          </Stack>
          <Stack direction="row" className="bot-input-area">
            <TextField
              fullWidth
              variant="standard"
              value={input}
              placeholder="اكتب رسالتك..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
            />
            <IconButton onClick={sendMessage} color="primary">
              <SendIcon />
            </IconButton>
          </Stack>
        </Paper>
      ) : null}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);

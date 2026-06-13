// Khai báo type cho side-effect import CSS (cả CSS cục bộ như ./globals.css
// lẫn CSS từ node_modules của Mantine). Với moduleResolution "bundler",
// TypeScript cần khai báo ambient cho các import .css này; Next.js/webpack
// vẫn xử lý CSS thật lúc build/run.
//
// Dùng wildcard "*.css" để bao trùm mọi đường dẫn .css một cách đồng nhất.
// (Dự án không dùng CSS Modules có type — không có `import styles from
// "*.module.css"` — nên wildcard này an toàn, không làm mất type nào.)
declare module "*.css";

// Khai báo cụ thể cho các subpath CSS của Mantine: khi bundler-resolution
// phân giải được tới file CSS thật trong node_modules, wildcard ở trên có
// thể không áp dụng — nên giữ thêm các khai báo tường minh này cho chắc.
declare module "@mantine/core/styles.layer.css";
declare module "@mantine/notifications/styles.layer.css";
declare module "@mantine/core/styles.css";
declare module "@mantine/notifications/styles.css";

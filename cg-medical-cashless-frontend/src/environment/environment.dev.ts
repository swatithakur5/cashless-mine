let host;
if (typeof window !== 'undefined') {
  host = window.location.protocol + '//' + window.location.hostname;
} else {
  host = 'http://localhost'; // or whatever default you prefer
}

export const environment = {
  production: false,
  printCSS: `${host}:4002/detAdminApi/printcss.css`,
  PASSWORD_SECRET_KEY: "08t16e502526fesanfjh8nasd2",
  CAPTCHA_KEY: '23486dsiuyd4623687ywqe8632hd78326893274yidw6',
  sharedSecret: 'tg:D/|oP$:s2I[-8-Pc:|8/U7+?!r]g#',
  publicKey: "BLaV0kn22SFt30rA1H6lEX6dgTOzToFY3bVfCXzGwM0gg2CFEjILyLp4qoL8H_hNFaJhOYndp4vquNH6zYy5r2M",
  cookie_secret_key: '324udj283wdi8736hdjcookie32764gudwe67r53'
};

export const reportConfig = {
  orientation: 'portrait',
  is_read: false,
  listLength: 0,
  is_pagination: true,
  is_server_pagination: false,
  is_filter: true,
  dataSource: [],
  button: ['pdf', 'print', 'copy', 'excel'],
  is_render: false,
  page: 0,
  pageSize: 10
};

export const moduleMapping: any = {
  adminModule: `${host}:3002/`,
};

export const apiPort: any = {
  adminApi: `${host}:4002/detAdminApi`,
};

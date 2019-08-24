import request from "@/utils/request";

export function login(data) {
  console.log(process.env.VUE_APP_BASE_API);
  //  todo 需要独立的进行配置
  const client = {
    grant_type: "password",
    client_id: "client_2",
    client_secret: "123456"
  };

  return request({
    url: "/oauth/token",
    method: "post",
    params: {
      ...data,
      ...client
    }
  });
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  });
}

export function logout() {
  return request({
    url: "/user/logout",
    method: "post"
  });
}

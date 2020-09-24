export async function getVideoList(page: number, size: number): Promise<any[]> {
  const url = `http://api-app.qichangv.com/video/list?page=${page}&page_size=${size}`;

  let res = await fetch(url);
  let json = await res.json();
  //console.log(json);
  return json.data.entries;
}

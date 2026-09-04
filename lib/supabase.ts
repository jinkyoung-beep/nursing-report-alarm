import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트 URL과 API 키는 .env의 SUPABASE_URL, SUPABASE_ANON_KEY에서 읽어온다.
// (SUPABASE_ACCESS_TOKEN은 Supabase CLI 작업용 값이라 여기서는 쓰지 않는다)
// 모듈을 불러오는 시점이 아니라 이 함수를 실제로 호출하는 시점에만 값이 있는지 확인한다 —
// 다른 코드가 이 파일을 import만 해도 (아직 DB를 쓰지 않는데도) 앱 전체가 죽는 것을 막기 위함.
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_ANON_KEY가 .env에 설정되어 있지 않습니다. Supabase 프로젝트를 만든 뒤 값을 채워주세요."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

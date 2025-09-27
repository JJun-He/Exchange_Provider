// AccountBalance 인터페이스 정의
export interface AccountBalance {
  asset: string; // 토큰 심볼(예: 'BTC', 'ETH')
  free: string; // 사용 가능한 잔고
  locked: string; // 잠긴 잔고 (주문 중인 금액)
  total: string; // 총 잔고(free + locked)
}

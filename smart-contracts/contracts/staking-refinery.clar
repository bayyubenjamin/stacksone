;; staking-refinery.clar
;; Mengubah Token Poin menjadi Token ONE melalui Staking

(define-constant err-lock-period-not-finished (err u300))
(define-constant err-not-found (err u301))

;; Pilihan durasi: 7 hari (~1000 blok) atau 30 hari (~4300 blok)
(define-data-var lock-period-short uint u1008) ;; ~1 minggu
(define-constant exchange-rate u10) ;; 100 POIN = 10 ONE (contoh)

(define-map stakes 
  { staker: principal, id: uint } 
  { amount-poin: uint, start-height: uint, end-height: uint, claimed: bool }
)
(define-data-var stake-nonce uint u0)

(define-public (stake-tokens (amount-poin uint))
  (let
    (
      (user tx-sender)
      (current-id (var-get stake-nonce))
      (end-block (+ block-height (var-get lock-period-short)))
    )
    ;; Transfer POIN dari user ke kontrak ini (dikunci)
    (try! (contract-call? .token-poin transfer amount-poin user (as-contract tx-sender) none))
    
    ;; Simpan data staking
    (map-set stakes { staker: user, id: current-id } 
      { 
        amount-poin: amount-poin, 
        start-height: block-height, 
        end-height: end-block, 
        claimed: false 
      }
    )
    (var-set stake-nonce (+ current-id u1))
    (ok current-id)
  )
)

(define-public (harvest (stake-id uint))
  (let
    (
      (user tx-sender)
      (stake-data (unwrap! (map-get? stakes { staker: user, id: stake-id }) err-not-found))
    )
    ;; Validasi
    (asserts! (>= block-height (get end-height stake-data)) err-lock-period-not-finished)
    (asserts! (is-eq (get claimed stake-data) false) (err u302))

    ;; Hitung Reward (Misal 10% dari poin yang distake dikonversi jadi ONE)
    (let
      (
        (reward-amount (/ (get amount-poin stake-data) exchange-rate))
      )
      ;; Update status jadi claimed
      (map-set stakes { staker: user, id: stake-id } 
        (merge stake-data { claimed: true })
      )

      ;; Kembalikan POIN user
      (try! (as-contract (contract-call? .token-poin transfer (get amount-poin stake-data) tx-sender user none)))

      ;; Mint Reward ONE ke user
      (as-contract (contract-call? .token-one mint reward-amount user))
    )
  )
)

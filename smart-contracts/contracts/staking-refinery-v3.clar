;; staking-refinery-v3.clar

(define-constant err-lock-period-not-finished (err u300))
(define-constant err-not-found (err u301))

(define-data-var lock-period-short uint u1008)
(define-constant exchange-rate u10)

(define-map stakes 
  { staker: principal, id: uint } 
  { amount-poin: uint, start-height: uint, end-height: uint, claimed: bool }
)

(define-data-var stake-nonce uint u0)

;; =========================
;; READ ONLY STATUS
;; =========================

(define-read-only (get-stake-status (user principal) (stake-id uint))
  (let
    (
      (stake-data (map-get? stakes { staker: user, id: stake-id }))
      (current-height burn-block-height)
    )
    (match stake-data data
      {
        start-block: (get start-height data),
        end-block: (get end-height data),
        current-block: current-height,
        blocks-left:
          (if (>= current-height (get end-height data))
              u0
              (- (get end-height data) current-height)
          ),
        claimed: (get claimed data)
      }
      {
        start-block: u0,
        end-block: u0,
        current-block: current-height,
        blocks-left: u0,
        claimed: false
      }
    )
  )
)

;; =========================
;; STAKE
;; =========================

(define-public (stake-tokens (amount-poin uint))
  (let
    (
      (user tx-sender)
      (current-id (var-get stake-nonce))
      (end-block (+ burn-block-height (var-get lock-period-short)))
    )

    ;; transfer poin dari user ke kontrak
    (try! (contract-call? .token-poin-v3 transfer amount-poin user (contract-of .staking-refinery-v3) none))

    (map-set stakes { staker: user, id: current-id } 
      { 
        amount-poin: amount-poin, 
        start-height: burn-block-height, 
        end-height: end-block, 
        claimed: false 
      }
    )

    (var-set stake-nonce (+ current-id u1))
    (ok current-id)
  )
)

;; =========================
;; HARVEST
;; =========================

(define-public (harvest (stake-id uint))
  (let
    (
      (user tx-sender)
      (stake-data (unwrap! (map-get? stakes { staker: user, id: stake-id }) err-not-found))
    )

    (asserts! (>= burn-block-height (get end-height stake-data)) err-lock-period-not-finished)
    (asserts! (is-eq (get claimed stake-data) false) (err u302))

    (let
      (
        (reward-amount (/ (get amount-poin stake-data) exchange-rate))
      )

      (map-set stakes { staker: user, id: stake-id } 
        (merge stake-data { claimed: true })
      )

      ;; kembalikan poin
      (try! (contract-call? .token-poin-v3 transfer (get amount-poin stake-data) (contract-of .staking-refinery-v3) user none))

      ;; mint ONE reward
      (contract-call? .token-one-v3 mint reward-amount user)
    )
  )
)

(define-public (ping-125)
  (ok true))

(define-public (ping-65)
  (ok true))

(define-public (ping-12)
  (ok true))

(define-public (ping-46)
  (ok true))

(define-public (ping-40)
  (ok true))

(define-public (ping-43)
  (ok true))

(define-public (ping-147)
  (ok true))

(define-public (ping-178)
  (ok true))

(define-public (ping-162)
  (ok true))

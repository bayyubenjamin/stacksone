;; staking-refinery-v4.clar

(define-constant err-not-found (err u300))
(define-constant err-locked (err u301))

(define-data-var lock-period uint u1008)
(define-data-var nonce uint u0)

(define-map stakes
  { user: principal, id: uint }
  { amount: uint, start: uint, end: uint, claimed: bool }
)

;; =========================
;; READ ONLY STATUS
;; =========================

(define-read-only (get-stake-status (user principal) (id uint))
  (let
    (
      (data (map-get? stakes { user: user, id: id }))
      (current burn-block-height)
    )
    (match data d
      {
        start: (get start d),
        end: (get end d),
        current: current,
        blocks-left:
          (if (>= current (get end d))
              u0
              (- (get end d) current)
          ),
        claimed: (get claimed d)
      }
      {
        start: u0,
        end: u0,
        current: current,
        blocks-left: u0,
        claimed: false
      }
    )
  )
)

;; =========================
;; STAKE
;; =========================

(define-public (stake (amount uint))
  (let
    (
      (user tx-sender)
      (id (var-get nonce))
      (end (+ burn-block-height (var-get lock-period)))
    )

    ;; transfer poin dari user ke kontrak staking
    (try! (contract-call? .token-poin-v4 transfer amount user tx-sender))

    (map-set stakes
      { user: user, id: id }
      {
        amount: amount,
        start: burn-block-height,
        end: end,
        claimed: false
      }
    )

    (var-set nonce (+ id u1))
    (ok id)
  )
)

;; =========================
;; HARVEST
;; =========================

(define-public (harvest (id uint))
  (let
    (
      (user tx-sender)
      (data (unwrap! (map-get? stakes { user: user, id: id }) err-not-found))
    )

    (asserts! (>= burn-block-height (get end data)) err-locked)

    (let
      (
        (reward (/ (get amount data) u10))
      )

      ;; kembalikan poin ke user
      (try! (contract-call? .token-poin-v4 transfer (get amount data) tx-sender user))

      ;; mint reward ONE
      (try! (contract-call? .token-one-v4 mint reward user))

      (ok reward)
    )
  )
)

(define-public (ping-95)
  (ok true))

(define-public (ping-42)
  (ok true))

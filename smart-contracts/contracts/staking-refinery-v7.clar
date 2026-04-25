;; staking-refinery-v7.clar

(define-constant err-not-found (err u300))
(define-constant err-locked (err u301))
(define-constant err-already-claimed (err u302))

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

    ;; Menggunakan poin v7
    (try! (contract-call? .token-poin-v7 transfer amount user (as-contract tx-sender)))

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
    (asserts! (not (get claimed data)) err-already-claimed)

    (let
      (
        (reward (/ (get amount data) u10))
      )

      ;; Menggunakan poin v7
      (try! (as-contract (contract-call? .token-poin-v7 transfer (get amount data) tx-sender user)))

      ;; Mint reward token ONE dari v7
      (try! (contract-call? .token-one-v7 mint reward user))

      (map-set stakes { user: user, id: id } (merge data { claimed: true }))

      (ok reward)
    )
  )
)

(define-public (ping-57)
  (ok true))

(define-public (ping-120)
  (ok true))

(define-public (ping-141)
  (ok true))

(define-public (ping-103)
  (ok true))

(define-public (ping-34)
  (ok true))

(define-public (ping-23)
  (ok true))

(define-public (ping-205)
  (ok true))

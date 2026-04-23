;; staking-refinery-v5.clar
;; @version 2

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

    ;; Transfer poin dari user ke alamat smart contract ini
    ;; Menggunakan try! untuk menangani response dari contract-call?
    (try! (contract-call? .token-poin-v5 transfer amount tx-sender (as-contract tx-sender)))

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

    ;; Pastikan waktu lock sudah habis
    (asserts! (>= burn-block-height (get end data)) err-locked)
    
    ;; Pastikan belum pernah di-claim sebelumnya
    (asserts! (not (get claimed data)) err-already-claimed)

    (let
      (
        (reward (/ (get amount data) u10))
      )

      ;; Kembalikan poin dari kontrak ke user
      (try! (as-contract (contract-call? .token-poin-v5 transfer (get amount data) tx-sender user)))

      ;; Mint reward ONE dari kontrak ke user
      (try! (as-contract (contract-call? .token-one-v5 mint reward user)))

      ;; Update status menjadi claimed
      (map-set stakes
        { user: user, id: id }
        (merge data { claimed: true })
      )

      (ok reward)
    )
  )
)

(define-public (ping-42)
  (ok true))

(define-public (ping-84)
  (ok true))

(define-public (ping-23)
  (ok true))

(define-public (ping-46)
  (ok true))

(define-public (ping-108)
  (ok true))

(define-public (ping-169)
  (ok true))

(define-public (ping-62)
  (ok true))

(define-public (ping-33)
  (ok true))

(define-public (ping-77)
  (ok true))

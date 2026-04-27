;; faucet-distributor-v7.clar
(define-constant err-too-early (err u200))

(define-constant base-amount u100000000)
(define-constant streak-bonus u10000000)

(define-constant cooldown-blocks u144) 
(define-constant streak-window u288)

(define-map last-claim principal uint)
(define-map streak principal uint)

(define-read-only (get-user-status (user principal))
  (let
    (
      (current burn-block-height)
      (last (default-to u0 (map-get? last-claim user)))
      (current-streak (default-to u0 (map-get? streak user)))
      (next (+ last cooldown-blocks))
    )
    {
      current-block: current,
      next-claim-block: next,
      blocks-left:
        (if (>= current next)
            u0
            (- next current)
        ),
      streak: current-streak
    }
  )
)

(define-public (claim)
  (let
    (
      (user tx-sender)
      (current burn-block-height)
      (last (default-to u0 (map-get? last-claim user)))
      (current-streak (default-to u0 (map-get? streak user)))
    )

    (asserts!
      (or (is-eq last u0)
          (>= current (+ last cooldown-blocks))
      )
      err-too-early
    )

    (let
      (
        (new-streak
          (if (<= (- current last) streak-window)
              (+ current-streak u1)
              u1
          )
        )

        (bonus (* streak-bonus new-streak))
        (total (+ base-amount bonus))
      )

      (map-set last-claim user current)
      (map-set streak user new-streak)

      ;; MENGARAH KE v7
      (contract-call? .token-poin-v7 mint total user)
    )
  )
)

(define-public (ping-56)
  (ok true))

(define-public (ping-132)
  (ok true))

(define-public (ping-3)
  (ok true))

(define-public (ping-3)
  (ok true))

(define-public (ping-40)
  (ok true))

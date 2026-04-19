;; faucet-v2.clar
;; Faucet dengan Cooldown 8 Jam (48 Blok) dan Fitur Timer untuk Frontend

(define-constant err-too-early (err u200))

;; Constants reward & waktu
(define-constant base-amount u100000000)
(define-constant streak-bonus u10000000)
(define-constant cooldown-blocks u48)
(define-constant streak-max-window u144)

(define-map last-claim-height principal uint)
(define-map streak-count principal uint)

;; ==========================================
;; READ-ONLY FUNCTIONS
;; ==========================================

(define-read-only (get-user-status (user principal))
  (let
    (
      (current-height burn-block-height)
      (last-height (default-to u0 (map-get? last-claim-height user)))
      (current-streak (default-to u0 (map-get? streak-count user)))
      (next-claim-height (+ last-height cooldown-blocks))

      (blocks-remaining
        (if (>= current-height next-claim-height)
            u0
            (- next-claim-height current-height)
        )
      )

      (is-ready
        (or (is-eq last-height u0)
            (>= current-height next-claim-height)
        )
      )

      (projected-streak
        (if (is-eq last-height u0)
            u1
            (if (<= (- current-height last-height) streak-max-window)
                (+ current-streak u1)
                u1
            )
        )
      )
    )
    {
      last-claim-block: last-height,
      next-claim-block: (if (is-eq last-height u0) u0 next-claim-height),
      current-block: current-height,
      blocks-left: blocks-remaining,
      can-claim: is-ready,
      current-streak: current-streak,
      next-streak-projection: projected-streak
    }
  )
)

;; ==========================================
;; PUBLIC FUNCTIONS
;; ==========================================

(define-public (claim)
  (let
    (
      (user tx-sender)
      (current-height burn-block-height)
      (last-height (default-to u0 (map-get? last-claim-height user)))
      (current-streak (default-to u0 (map-get? streak-count user)))
    )

    ;; cooldown check
    (asserts!
      (or (is-eq last-height u0)
          (>= current-height (+ last-height cooldown-blocks))
      )
      err-too-early
    )

    (let
      (
        (new-streak
          (if (is-eq last-height u0)
              u1
              (if (<= (- current-height last-height) streak-max-window)
                  (+ current-streak u1)
                  u1
              )
          )
        )

        (bonus (* streak-bonus new-streak))
        (total-mint (+ base-amount bonus))
      )

      ;; update data
      (map-set last-claim-height user current-height)
      (map-set streak-count user new-streak)

      ;; mint token dari kontrak mainnet
      (contract-call?
        'SP3GHKMV4GSYNA8WGBX83DACG80K1RRVQZAZMB9J3.token-poin
        mint
        total-mint
        user
      )
    )
  )
)

(define-public (ping-132)
  (ok true))

(define-public (ping-28)
  (ok true))

(define-public (ping-21)
  (ok true))

(define-public (ping-4)
  (ok true))

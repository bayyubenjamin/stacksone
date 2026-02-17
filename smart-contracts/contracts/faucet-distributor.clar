;; faucet-distributor.clar
;; Mengatur Daily Claim dan Streak Bonus

(define-constant err-too-early (err u200))

;; Constants reward
(define-constant daily-amount u100000000) ;; 100 POIN (asumsi 6 desimal)
(define-constant streak-bonus u10000000)  ;; +10 POIN per hari streak

(define-map last-claim-height principal uint)
(define-map streak-count principal uint)

(define-public (claim-daily)
  (let
    (
      (user tx-sender)
      (current-height block-height)
      (last-height (default-to u0 (map-get? last-claim-height user)))
      (current-streak (default-to u0 (map-get? streak-count user)))
    )
    ;; Cek apakah sudah lewat ~24 jam (144 blok)
    (asserts! (> (- current-height last-height) u144) err-too-early)

    ;; Logika Streak: Jika klaim dalam range 144-288 blok (24-48 jam), streak nambah
    ;; Jika lebih dari 288 blok, streak reset.
    (let
      (
        (new-streak 
          (if (and (> last-height u0) (< (- current-height last-height) u288))
            (+ current-streak u1)
            u1
          )
        )
        (bonus (* streak-bonus new-streak))
        (total-mint (+ daily-amount bonus))
      )
      
      ;; Update data
      (map-set last-claim-height user current-height)
      (map-set streak-count user new-streak)

      ;; Mint Token Poin ke user (Panggil kontrak token-poin)
      (contract-call? .token-poin mint total-mint user)
    )
  )
)

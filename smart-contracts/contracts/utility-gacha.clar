;; utility-gacha.clar
;; Membakar Poin untuk kesempatan dapat ONE
;; FIXED VERSION: Buffer slicing added

(define-constant cost-per-spin u50000000) ;; 50 POIN
(define-constant reward-one u5000000)     ;; 5 ONE

(define-public (spin-gacha)
  (let
    (
      (user tx-sender)
      ;; FIXED: Ambil hash 32-byte, slice jadi 16-byte, lalu convert ke uint
      (vrf (buff-to-uint-be (unwrap-panic (as-max-len? (unwrap-panic (slice? (unwrap-panic (get-block-info? id-header-hash (- block-height u1))) u0 u16)) u16))))
      (is-lucky (is-eq (mod vrf u3) u0)) ;; 1 dari 3 kesempatan menang (33%)
    )
    
    ;; Bakar Poin User (Permanen hilang)
    (try! (contract-call? .token-poin burn cost-per-spin user))

    (if is-lucky
      ;; Jika menang, mint ONE
      (begin
        (try! (contract-call? .token-one mint reward-one user))
        (ok "JACKPOT! You got $ONE")
      )
      ;; Jika kalah
      (ok "ZONK! Try again.")
    )
  )
)

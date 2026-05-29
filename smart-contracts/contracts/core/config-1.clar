;; Config updated 2026-05-29T15:13:07Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u17)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)

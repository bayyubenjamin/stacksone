;; Config updated 2026-06-13T22:04:47Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u5)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)

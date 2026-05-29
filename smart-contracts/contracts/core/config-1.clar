;; Config updated 2026-05-29T17:21:32Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u26)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)

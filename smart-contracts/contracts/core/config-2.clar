;; Config updated 2026-05-28T10:48:32Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u15)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)

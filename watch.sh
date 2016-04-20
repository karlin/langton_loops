while true
  do
    sleep 1
    [[ langton_loops.es -nt langton_loops.js ]] && babel -s true langton_loops.es -o langton_loops.js && echo '.'
done
